import {
    expect,
    Page,
    test
} from "@playwright/test";

const REQUIRED_MODULES = [
    "AssessmentDefinition",
    "AssessmentUtils",
    "AssessmentStorage",
    "IndustryCatalog",
    "AssessmentValidation",
    "AssessmentFields",
    "AssessmentScreens",
    "AssessmentReview",
    "ReportMapper",
    "AdvisoryDelivery",
    "AssessmentState"
] as const;

const STORAGE_KEY =
    "growwithhr-advisory-briefing-v2";

interface BrowserErrorLog {
    consoleErrors: string[];
    pageErrors: string[];
}

function collectBrowserErrors(
    page: Page
): BrowserErrorLog {
    const errors: BrowserErrorLog = {
        consoleErrors: [],
        pageErrors: []
    };

    page.on(
        "console",
        (message) => {
            if (
                message.type() ===
                "error"
            ) {
                errors.consoleErrors.push(
                    message.text()
                );
            }
        }
    );

    page.on(
        "pageerror",
        (error) => {
            errors.pageErrors.push(
                error.message
            );
        }
    );

    return errors;
}

async function clearBrowserState(
    page: Page
): Promise<void> {
    await page.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });
}

async function waitForAssessment(
    page: Page
): Promise<void> {
    await page.waitForFunction(() => {
        const browserWindow =
            window as Window & {
                executiveAssessment?: {
                    __modularFacadeInstalled?:
                        boolean;
                };
            };

        return Boolean(
            browserWindow
                .executiveAssessment
                ?.__modularFacadeInstalled
        );
    });
}

async function seedSavedAssessment(
    page: Page
): Promise<void> {
    await page.addInitScript(
        ({ storageKey }) => {
            window.localStorage.setItem(
                storageKey,
                JSON.stringify({
                    version:
                        "2.1.0",

                    schemaVersion:
                        1,

                    started:
                        true,

                    completed:
                        false,

                    currentMoment:
                        2,

                    answers: {
                        locations:
                            "1",

                        countries:
                            "1",

                        expansionPlans:
                            [],

                        priorities:
                            [],

                        companyName:
                            "Modular Test Company",

                        industry:
                            "Information Technology / SaaS",

                        industryId:
                            "information_technology",

                        industryCategory:
                            "Technology & Digital",

                        industryRuleProfile:
                            "Information Technology / SaaS",

                        nature:
                            "We provide HR technology services.",

                        founded:
                            "2024",

                        foundedNotSure:
                            false,

                        entity:
                            "Private Limited"
                    },

                    lead: {
                        name:
                            "",

                        email:
                            "",

                        role:
                            "",

                        marketingConsent:
                            false
                    },

                    ui: {
                        showSupplementalWorkforce:
                            false
                    },

                    updatedAt:
                        new Date()
                            .toISOString()
                })
            );
        },
        {
            storageKey:
                STORAGE_KEY
        }
    );
}

test.describe(
    "Executive assessment modular controller",
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
            "loads every extracted module",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                const browserErrors =
                    collectBrowserErrors(
                        page
                    );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                await expect(
                    page.locator(
                        "#assessmentShell"
                    )
                ).toBeVisible();

                const moduleStatus =
                    await page.evaluate(
                        (
                            requiredModules
                        ) => {
                            const modules =
                                (
                                    window as Window & {
                                        GrowWithHRModules?: Record<
                                            string,
                                            unknown
                                        >;
                                    }
                                )
                                    .GrowWithHRModules ||
                                {};

                            return Object.fromEntries(
                                requiredModules.map(
                                    (
                                        moduleName
                                    ) => [
                                        moduleName,
                                        Boolean(
                                            modules[
                                                moduleName
                                            ]
                                        )
                                    ]
                                )
                            );
                        },
                        REQUIRED_MODULES
                    );

                for (
                    const moduleName of
                    REQUIRED_MODULES
                ) {
                    expect(
                        moduleStatus[
                            moduleName
                        ],
                        `${moduleName} should be loaded`
                    ).toBe(true);
                }

                expect(
                    browserErrors
                        .pageErrors
                ).toEqual([]);

                expect(
                    browserErrors
                        .consoleErrors
                ).toEqual([]);
            }
        );

        test(
            "initializes the modular controller and its services",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                const status =
                    await page.evaluate(
                        () => {
                            const browserWindow =
                                window as Window & {
                                    ExecutiveAdvisoryBriefing?:
                                        unknown;

                                    executiveAssessment?: {
                                        __modularFacadeInstalled?:
                                            boolean;

                                        __modularFacadeVersion?:
                                            string;

                                        stateModel?:
                                            unknown;

                                        assessmentState?:
                                            unknown;

                                        industryCatalogService?:
                                            unknown;

                                        deliveryService?:
                                            unknown;

                                        renderBusinessBasics?:
                                            () => string;

                                        validateBusinessBasics?:
                                            () => boolean;

                                        writeReportData?:
                                            () => object;

                                        saveNow?:
                                            () => object | null;
                                    };
                                };

                            const application =
                                browserWindow
                                    .executiveAssessment;

                            return {
                                hasControllerClass:
                                    Boolean(
                                        browserWindow
                                            .ExecutiveAdvisoryBriefing
                                    ),

                                hasApplication:
                                    Boolean(
                                        application
                                    ),

                                modularControllerReady:
                                    Boolean(
                                        application
                                            ?.__modularFacadeInstalled
                                    ),

                                modularVersion:
                                    application
                                        ?.__modularFacadeVersion,

                                hasStateModel:
                                    Boolean(
                                        application
                                            ?.stateModel ||
                                        application
                                            ?.assessmentState
                                    ),

                                hasIndustryService:
                                    Boolean(
                                        application
                                            ?.industryCatalogService
                                    ),

                                hasDeliveryService:
                                    Boolean(
                                        application
                                            ?.deliveryService
                                    ),

                                hasScreenRenderer:
                                    typeof application
                                        ?.renderBusinessBasics ===
                                    "function",

                                hasValidation:
                                    typeof application
                                        ?.validateBusinessBasics ===
                                    "function",

                                hasReportMapper:
                                    typeof application
                                        ?.writeReportData ===
                                    "function",

                                hasStorageFacade:
                                    typeof application
                                        ?.saveNow ===
                                    "function"
                            };
                        }
                    );

                expect(
                    status
                        .hasControllerClass
                ).toBe(true);

                expect(
                    status.hasApplication
                ).toBe(true);

                expect(
                    status
                        .modularControllerReady
                ).toBe(true);

                expect(
                    status.modularVersion
                ).toBe("1.0.0");

                expect(
                    status.hasStateModel
                ).toBe(true);

                expect(
                    status
                        .hasIndustryService
                ).toBe(true);

                expect(
                    status
                        .hasDeliveryService
                ).toBe(true);

                expect(
                    status
                        .hasScreenRenderer
                ).toBe(true);

                expect(
                    status.hasValidation
                ).toBe(true);

                expect(
                    status.hasReportMapper
                ).toBe(true);

                expect(
                    status.hasStorageFacade
                ).toBe(true);
            }
        );

        test(
            "keeps the first-visit experience working",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                await expect(
                    page.locator(
                        "#firstVisitActions"
                    )
                ).toBeVisible();

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                "Start my advisory"
                        }
                    )
                    .click();

                await expect(
                    page.locator(
                        "#conversationWorkspace"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#stepTitle"
                    )
                ).toContainText(
                    "business you’re building"
                );

                await expect(
                    page.locator(
                        "#companyName"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#industry"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#nature"
                    )
                ).toBeVisible();
            }
        );

        test(
            "renders the first screen through AssessmentScreens",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                const renderResult =
                    await page.evaluate(
                        () => {
                            const browserWindow =
                                window as Window & {
                                    executiveAssessment?: {
                                        renderBusinessBasics:
                                            () => string;
                                    };
                                };

                            return (
                                browserWindow
                                    .executiveAssessment
                                    ?.renderBusinessBasics() ||
                                ""
                            );
                        }
                    );

                expect(
                    renderResult
                ).toContain(
                    'id="companyName"'
                );

                expect(
                    renderResult
                ).toContain(
                    'id="industry"'
                );

                expect(
                    renderResult
                ).toContain(
                    'id="nature"'
                );

                expect(
                    renderResult
                ).toContain(
                    "advisory-field-group"
                );
            }
        );

        test(
            "restores existing saved progress",
            async ({ page }) => {
                await seedSavedAssessment(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                await expect(
                    page.locator(
                        "#resumePanel"
                    )
                ).toBeVisible();

                await expect(
                    page.getByText(
                        "Your progress is saved."
                    )
                ).toBeVisible();

                const restoredState =
                    await page.evaluate(
                        () => {
                            const application =
                                (
                                    window as Window & {
                                        executiveAssessment?: {
                                            started:
                                                boolean;

                                            currentMoment:
                                                number;

                                            answers: {
                                                companyName?:
                                                    string;
                                            };

                                            stateModel?: {
                                                createPersistenceSnapshot:
                                                    () => {
                                                        currentMoment:
                                                            number;

                                                        answers: {
                                                            companyName?:
                                                                string;
                                                        };
                                                    };
                                            };
                                        };
                                    }
                                )
                                    .executiveAssessment;

                            if (!application) {
                                return null;
                            }

                            const snapshot =
                                application
                                    .stateModel
                                    ?.createPersistenceSnapshot();

                            return {
                                started:
                                    application.started,

                                currentMoment:
                                    application
                                        .currentMoment,

                                companyName:
                                    application
                                        .answers
                                        .companyName,

                                snapshotMoment:
                                    snapshot
                                        ?.currentMoment,

                                snapshotCompany:
                                    snapshot
                                        ?.answers
                                        .companyName
                            };
                        }
                    );

                expect(
                    restoredState
                        ?.started
                ).toBe(true);

                expect(
                    restoredState
                        ?.currentMoment
                ).toBe(2);

                expect(
                    restoredState
                        ?.companyName
                ).toBe(
                    "Modular Test Company"
                );

                expect(
                    restoredState
                        ?.snapshotMoment
                ).toBe(2);

                expect(
                    restoredState
                        ?.snapshotCompany
                ).toBe(
                    "Modular Test Company"
                );
            }
        );

        test(
            "delegates validation to AssessmentValidation",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                "Start my advisory"
                        }
                    )
                    .click();

                await page
                    .locator(
                        "#nextButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#companyNameError"
                    )
                ).toContainText(
                    "Enter your organisation’s name."
                );

                await expect(
                    page.locator(
                        "#industryError"
                    )
                ).toContainText(
                    "Choose the industry"
                );

                await expect(
                    page.locator(
                        "#natureError"
                    )
                ).toContainText(
                    "Describe what your organisation does"
                );

                await expect(
                    page.locator(
                        "#companyName"
                    )
                ).toHaveAttribute(
                    "aria-invalid",
                    "true"
                );
            }
        );

        test(
            "writes progress through AssessmentStorage",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                "Start my advisory"
                        }
                    )
                    .click();

                await page
                    .locator(
                        "#companyName"
                    )
                    .fill(
                        "Storage Test Company"
                    );

                await page.evaluate(
                    () => {
                        const application =
                            (
                                window as Window & {
                                    executiveAssessment?: {
                                        saveNow:
                                            () => unknown;
                                    };
                                }
                            )
                                .executiveAssessment;

                        application
                            ?.saveNow();
                    }
                );

                const saved =
                    await page.evaluate(
                        (storageKey) => {
                            const raw =
                                window
                                    .localStorage
                                    .getItem(
                                        storageKey
                                    );

                            return raw
                                ? JSON.parse(
                                    raw
                                )
                                : null;
                        },
                        STORAGE_KEY
                    );

                expect(saved)
                    .not
                    .toBeNull();

                expect(
                    saved.started
                ).toBe(true);

                expect(
                    saved.answers
                        .companyName
                ).toBe(
                    "Storage Test Company"
                );

                expect(
                    saved.schemaVersion
                ).toBe(1);
            }
        );

        test(
            "keeps report mapping free from delivery side effects",
            async ({ page }) => {
                await clearBrowserState(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await waitForAssessment(
                    page
                );

                const report =
                    await page.evaluate(
                        () => {
                            const browserWindow =
                                window as Window & {
                                    GrowWithHRModules?: {
                                        ReportMapper?: {
                                            buildReportData:
                                                (
                                                    context:
                                                    object
                                                ) =>
                                                    Record<
                                                        string,
                                                        unknown
                                                    >;
                                        };
                                    };
                                };

                            return browserWindow
                                .GrowWithHRModules
                                ?.ReportMapper
                                ?.buildReportData({
                                    answers: {
                                        companyName:
                                            "Mapper Test Company",

                                        industry:
                                            "Information Technology / SaaS",

                                        industryId:
                                            "information_technology",

                                        industryCategory:
                                            "Technology & Digital",

                                        industryRuleProfile:
                                            "Information Technology / SaaS",

                                        locations:
                                            "1",

                                        countries:
                                            "1",

                                        expansionPlans:
                                            [],

                                        priorities:
                                            []
                                    },

                                    lead: {
                                        name:
                                            "Test User",

                                        email:
                                            "test@example.com",

                                        role:
                                            "founder-business-leader",

                                        marketingConsent:
                                            false
                                    }
                                });
                        }
                    );

                expect(
                    report.companyName
                ).toBe(
                    "Mapper Test Company"
                );

                expect(
                    report.recipientEmail
                ).toBe(
                    "test@example.com"
                );

                expect(
                    report.locations
                ).toBe(1);

                expect(
                    report.countries
                ).toBe(1);
            }
        );
    }
);
