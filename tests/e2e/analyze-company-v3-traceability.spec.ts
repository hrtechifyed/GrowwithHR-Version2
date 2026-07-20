import {
    expect,
    test,
    type Page
} from "@playwright/test";

const PRIVATE_BETA_ROUTE =
    "/analyze-company-v3.html";

const PROTECTED_STATE_KEY =
    "growwithhr-advisory-briefing-v2";

const FIXED_DATE_TIME =
    "2026-07-21T00:00:00.000Z";

const UPDATED_DATE_TIME =
    "2026-07-21T01:00:00.000Z";

const EXPECTED_RULE_COUNT =
    7;

const EXPECTED_CONFIRMED_FACT_COUNT =
    13;

const EXPECTED_DERIVED_FACT_COUNT =
    8;

type StorageWriteRecord = {
    method:
        | "setItem"
        | "removeItem"
        | "clear";

    key:
        string |
        null;

    stack:
        string;
};

type DiagnosticsControllerState = {
    version:
        string;

    phase:
        string;

    refreshedAt:
        string |
        null;

    hasResult:
        boolean;

    error:
        string |
        null;

    protectedAssessmentKey:
        string;

    newStorageKeyIntroduced:
        boolean;

    stableReportMutation:
        boolean;

    adapterStatus: {
        version:
            string;

        catalogUrl:
            string;

        catalogLoaded:
            boolean;

        catalogLoading:
            boolean;

        protectedAssessmentKey:
            string;

        newStorageKeyIntroduced:
            boolean;

        stableReportMutation:
            boolean;
    };
};

type TraceabilityDiagnosticsController = {
    version:
        string;

    protectedAssessmentKey:
        string;

    refresh:
        () => Promise<unknown>;

    getState:
        () => DiagnosticsControllerState;

    getResult:
        () => unknown;

    getCatalog:
        () => unknown;
};

type TraceabilityWindow =
    Window &
    typeof globalThis & {
        GrowWithHRTraceabilityDiagnostics?:
            TraceabilityDiagnosticsController;

        __growwithhrStorageWrites?:
            StorageWriteRecord[];
    };

function createApplicableState() {
    return {
        version:
            "2.1.0",

        schemaVersion:
            1,

        started:
            true,

        completed:
            true,

        currentMoment:
            0,

        answers: {
            employees:
                32,

            contractWorkers:
                4,

            interns:
                2,

            apprentices:
                1,

            workModel:
                "Hybrid",

            remoteBand:
                "25-50",

            primaryState:
                "Maharashtra",

            locations:
                3,

            countries:
                1,

            hiringPlans:
                "Significant Growth",

            expansionPlans: [
                "new-locations",
                "scale-operations"
            ],

            peopleFunction:
                "Founder Led",

            priorities: [
                "policies-compliance",
                "workforce-planning"
            ]
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
                true
        },

        updatedAt:
            FIXED_DATE_TIME
    };
}

async function installProtectedState(
    page: Page,
    state: ReturnType<
        typeof createApplicableState
    >,
    monitorStorageWrites = false
) {
    await page.addInitScript(
        ({
            key,
            value,
            monitor
        }) => {
            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

            if (!monitor) {
                return;
            }

            const storageWrites:
                StorageWriteRecord[] =
                [];

            (
                window as
                    TraceabilityWindow
            )
                .__growwithhrStorageWrites =
                storageWrites;

            const originalSetItem =
                Storage.prototype
                    .setItem;

            const originalRemoveItem =
                Storage.prototype
                    .removeItem;

            const originalClear =
                Storage.prototype
                    .clear;

            Storage.prototype.setItem =
                function setItem(
                    name,
                    storedValue
                ) {
                    storageWrites.push({
                        method:
                            "setItem",

                        key:
                            String(name),

                        stack:
                            new Error()
                                .stack ||
                            ""
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
                    storageWrites.push({
                        method:
                            "removeItem",

                        key:
                            String(name),

                        stack:
                            new Error()
                                .stack ||
                            ""
                    });

                    return originalRemoveItem.call(
                        this,
                        name
                    );
                };

            Storage.prototype.clear =
                function clear() {
                    storageWrites.push({
                        method:
                            "clear",

                        key:
                            null,

                        stack:
                            new Error()
                                .stack ||
                            ""
                    });

                    return originalClear.call(
                        this
                    );
                };
        },
        {
            key:
                PROTECTED_STATE_KEY,

            value:
                state,

            monitor:
                monitorStorageWrites
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

async function expectDiagnosticsState(
    page: Page,
    state:
        | "ready"
        | "empty"
        | "error"
) {
    await expect(
        page.locator(
            "#dnaTraceability"
        )
    ).toHaveAttribute(
        "data-traceability-state",
        state
    );
}

test.describe(
    "Compliance DNA M2 traceability diagnostics",
    () => {
        test(
            "renders deterministic facts, rules, recommendations, evidence and sources",
            async ({
                page
            }) => {
                await installProtectedState(
                    page,
                    createApplicableState()
                );

                await openPrivateBeta(
                    page
                );

                await expectDiagnosticsState(
                    page,
                    "ready"
                );

                const root =
                    page.locator(
                        "#dnaTraceability"
                    );

                await expect(
                    root
                ).toBeVisible();

                await expect(
                    root
                ).toHaveAttribute(
                    "data-contract-version",
                    "1.0.0"
                );

                await expect(
                    root
                ).toHaveAttribute(
                    "data-catalog-version",
                    "1.0.0"
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityConfirmedCount"
                    )
                ).toHaveText(
                    String(
                        EXPECTED_CONFIRMED_FACT_COUNT
                    )
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityDerivedCount"
                    )
                ).toHaveText(
                    String(
                        EXPECTED_DERIVED_FACT_COUNT
                    )
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityRuleCount"
                    )
                ).toHaveText(
                    String(
                        EXPECTED_RULE_COUNT
                    )
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityRecommendationCount"
                    )
                ).toHaveText(
                    String(
                        EXPECTED_RULE_COUNT
                    )
                );

                const ruleCards =
                    page.locator(
                        ".dna-traceability__rule-card"
                    );

                const recommendationCards =
                    page.locator(
                        ".dna-traceability__recommendation-card"
                    );

                await expect(
                    ruleCards
                ).toHaveCount(
                    EXPECTED_RULE_COUNT
                );

                await expect(
                    recommendationCards
                ).toHaveCount(
                    EXPECTED_RULE_COUNT
                );

                const growthRule =
                    page.locator(
                        [
                            ".dna-traceability__rule-card",
                            '[data-rule-id="rule.growth.rapid-change.workforce-planning"]'
                        ].join("")
                    );

                await expect(
                    growthRule
                ).toHaveAttribute(
                    "data-applicability-status",
                    "applicable"
                );

                await expect(
                    growthRule
                ).toContainText(
                    "Rapid-change workforce planning review"
                );

                await expect(
                    growthRule
                ).toContainText(
                    "fact.growth.rapid-growth"
                );

                await expect(
                    growthRule
                ).toContainText(
                    "fact.growth.expansion-activity"
                );

                const growthRecommendation =
                    page.locator(
                        [
                            ".dna-traceability__recommendation-card",
                            '[data-recommendation-id="recommendation.growth.create-workforce-plan"]'
                        ].join("")
                    );

                await expect(
                    growthRecommendation
                ).toBeVisible();

                await expect(
                    growthRecommendation
                ).toHaveAttribute(
                    "data-applicability-status",
                    "applicable"
                );

                await expect(
                    growthRecommendation
                ).toContainText(
                    "Create a workforce plan"
                );

                await expect(
                    growthRecommendation
                ).toContainText(
                    "Evidence: Not requested"
                );

                await expect(
                    growthRecommendation
                        .locator(
                            '[data-evidence-status="not-requested"]'
                        )
                ).toBeVisible();

                const sourceLink =
                    growthRecommendation
                        .locator(
                            ".dna-traceability__source-link"
                        )
                        .first();

                await expect(
                    sourceLink
                ).toBeVisible();

                await expect(
                    sourceLink
                ).toHaveAttribute(
                    "href",
                    /^https:\/\//
                );

                await expect(
                    sourceLink
                ).toHaveAttribute(
                    "target",
                    "_blank"
                );

                await expect(
                    sourceLink
                ).toHaveAttribute(
                    "rel",
                    /noopener/
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityEmpty"
                    )
                ).toBeHidden();

                await expect(
                    page.locator(
                        "#dnaTraceabilityError"
                    )
                ).toBeHidden();

                const controllerState =
                    await page.evaluate(
                        () => {
                            const controller =
                                (
                                    window as
                                        TraceabilityWindow
                                )
                                    .GrowWithHRTraceabilityDiagnostics;

                            return (
                                controller
                                    ?.getState() ||
                                null
                            );
                        }
                    );

                expect(
                    controllerState
                ).toMatchObject({
                    version:
                        "1.0.0",

                    phase:
                        "ready",

                    hasResult:
                        true,

                    error:
                        null,

                    protectedAssessmentKey:
                        PROTECTED_STATE_KEY,

                    newStorageKeyIntroduced:
                        false,

                    stableReportMutation:
                        false,

                    adapterStatus: {
                        catalogLoaded:
                            true,

                        protectedAssessmentKey:
                            PROTECTED_STATE_KEY,

                        newStorageKeyIntroduced:
                            false,

                        stableReportMutation:
                            false
                    }
                });

                const storageKeys =
                    await page.evaluate(
                        () => {
                            return Array.from(
                                {
                                    length:
                                        localStorage
                                            .length
                                },
                                (
                                    _,
                                    index
                                ) =>
                                    localStorage.key(
                                        index
                                    )
                            )
                                .filter(
                                    (
                                        key
                                    ): key is string =>
                                        Boolean(key)
                                )
                                .sort();
                        }
                    );

                expect(
                    storageKeys
                ).toContain(
                    PROTECTED_STATE_KEY
                );

                expect(
                    storageKeys.filter(
                        (key) =>
                            key
                                .toLowerCase()
                                .includes(
                                    "traceability"
                                )
                    )
                ).toEqual([]);
            }
        );

        test(
            "refreshes changed protected answers without writing traceability data",
            async ({
                page
            }) => {
                await installProtectedState(
                    page,
                    createApplicableState(),
                    true
                );

                await openPrivateBeta(
                    page
                );

                await expectDiagnosticsState(
                    page,
                    "ready"
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityRecommendationCount"
                    )
                ).toHaveText(
                    "7"
                );

                await page.evaluate(
                    ({
                        key,
                        updatedAt
                    }) => {
                        const rawState =
                            localStorage
                                .getItem(
                                    key
                                );

                        if (!rawState) {
                            throw new Error(
                                "Protected assessment state is missing."
                            );
                        }

                        const state =
                            JSON.parse(
                                rawState
                            );

                        state.answers = {
                            ...state.answers,

                            employees:
                                0,

                            contractWorkers:
                                0,

                            interns:
                                0,

                            apprentices:
                                0,

                            workModel:
                                "Office Based",

                            remoteBand:
                                "0",

                            locations:
                                1,

                            countries:
                                1,

                            hiringPlans:
                                "Maintain Current Size",

                            expansionPlans: [
                                "no-major-expansion"
                            ],

                            peopleFunction:
                                "Dedicated HR Team",

                            priorities: [
                                "hiring-onboarding"
                            ]
                        };

                        state.updatedAt =
                            updatedAt;

                        localStorage.setItem(
                            key,
                            JSON.stringify(
                                state
                            )
                        );
                    },
                    {
                        key:
                            PROTECTED_STATE_KEY,

                        updatedAt:
                            UPDATED_DATE_TIME
                    }
                );

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                "Refresh traceability",
                            exact:
                                true
                        }
                    )
                    .click();

                await expect(
                    page.locator(
                        "#dnaTraceabilityRecommendationCount"
                    )
                ).toHaveText(
                    "1"
                );

                const employmentRule =
                    page.locator(
                        [
                            ".dna-traceability__rule-card",
                            '[data-rule-id="rule.governance.employment-documentation.review"]'
                        ].join("")
                    );

                await expect(
                    employmentRule
                ).toHaveAttribute(
                    "data-applicability-status",
                    "not-currently-applicable"
                );

                const locationRule =
                    page.locator(
                        [
                            ".dna-traceability__rule-card",
                            '[data-rule-id="rule.workplace.multi-location.review"]'
                        ].join("")
                    );

                await expect(
                    locationRule
                ).toHaveAttribute(
                    "data-applicability-status",
                    "not-currently-applicable"
                );

                const peopleRule =
                    page.locator(
                        [
                            ".dna-traceability__rule-card",
                            '[data-rule-id="rule.people.ownership.formal-function-review"]'
                        ].join("")
                    );

                await expect(
                    peopleRule
                ).toHaveAttribute(
                    "data-applicability-status",
                    "not-currently-applicable"
                );

                const remainingRecommendation =
                    page.locator(
                        ".dna-traceability__recommendation-card"
                    );

                await expect(
                    remainingRecommendation
                ).toHaveCount(
                    1
                );

                await expect(
                    remainingRecommendation
                ).toHaveAttribute(
                    "data-recommendation-id",
                    "recommendation.governance.review-state-specific-requirements"
                );

                const diagnosticsStorageWrites =
                    await page.evaluate(
                        () => {
                            return (
                                (
                                    window as
                                        TraceabilityWindow
                                )
                                    .__growwithhrStorageWrites ||
                                []
                            ).filter(
                                (record) => {
                                    return (
                                        record.stack.includes(
                                            "traceability-diagnostics.js"
                                        ) ||
                                        record.stack.includes(
                                            "traceability-adapter.js"
                                        ) ||
                                        record.key
                                            ?.toLowerCase()
                                            .includes(
                                                "traceability"
                                            ) ===
                                            true
                                    );
                                }
                            );
                        }
                    );

                expect(
                    diagnosticsStorageWrites
                ).toEqual([]);

                const controllerState =
                    await page.evaluate(
                        () => {
                            return (
                                window as
                                    TraceabilityWindow
                            )
                                .GrowWithHRTraceabilityDiagnostics
                                ?.getState() ||
                                null;
                        }
                    );

                expect(
                    controllerState
                ).toMatchObject({
                    phase:
                        "ready",

                    refreshedAt:
                        UPDATED_DATE_TIME,

                    hasResult:
                        true,

                    newStorageKeyIntroduced:
                        false,

                    stableReportMutation:
                        false
                });
            }
        );

        test(
            "shows a safe error state when the governed catalog cannot load",
            async ({
                page
            }) => {
                await page.route(
                    "**/data/assessment/recommendation-rules.v1.json",
                    async (
                        route
                    ) => {
                        await route.fulfill({
                            status:
                                503,

                            contentType:
                                "application/json",

                            body:
                                JSON.stringify({
                                    error:
                                        "Unavailable"
                                })
                        });
                    }
                );

                await installProtectedState(
                    page,
                    createApplicableState()
                );

                await openPrivateBeta(
                    page
                );

                await expectDiagnosticsState(
                    page,
                    "error"
                );

                const errorPanel =
                    page.locator(
                        "#dnaTraceabilityError"
                    );

                await expect(
                    errorPanel
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#dnaTraceabilityErrorMessage"
                    )
                ).toContainText(
                    "status 503"
                );

                await expect(
                    page.locator(
                        "#dnaTraceabilityRuleList"
                    )
                ).toBeHidden();

                await expect(
                    page.locator(
                        "#dnaTraceabilityRecommendationList"
                    )
                ).toBeHidden();

                const stableAssessmentLink =
                    errorPanel.getByRole(
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
                    "analyze-company.html"
                );

                await expect(
                    page.getByRole(
                        "button",
                        {
                            name:
                                "Refresh traceability",
                            exact:
                                true
                        }
                    )
                ).toBeEnabled();
            }
        );

        test(
            "keeps traceability explanations readable and operable on mobile",
            async ({
                page
            }) => {
                await page.setViewportSize({
                    width:
                        390,

                    height:
                        844
                });

                await installProtectedState(
                    page,
                    createApplicableState()
                );

                await openPrivateBeta(
                    page
                );

                await expectDiagnosticsState(
                    page,
                    "ready"
                );

                const root =
                    page.locator(
                        "#dnaTraceability"
                    );

                await expect(
                    root
                ).toBeVisible();

                const metricColumnCount =
                    await page
                        .locator(
                            ".dna-traceability__metrics"
                        )
                        .evaluate(
                            (
                                element
                            ) => {
                                return getComputedStyle(
                                    element
                                )
                                    .gridTemplateColumns
                                    .split(
                                        /\s+/
                                    )
                                    .filter(Boolean)
                                    .length;
                            }
                        );

                expect(
                    metricColumnCount
                ).toBe(
                    1
                );

                const growthRecommendation =
                    page.locator(
                        [
                            ".dna-traceability__recommendation-card",
                            '[data-recommendation-id="recommendation.growth.create-workforce-plan"]'
                        ].join("")
                    );

                await expect(
                    growthRecommendation
                ).toBeVisible();

                const cardHeaderDirection =
                    await growthRecommendation
                        .locator(
                            ".dna-traceability__card-header"
                        )
                        .evaluate(
                            (
                                element
                            ) =>
                                getComputedStyle(
                                    element
                                )
                                    .flexDirection
                        );

                expect(
                    cardHeaderDirection
                ).toBe(
                    "column"
                );

                const contentFitsContainer =
                    await root.evaluate(
                        (
                            element
                        ) => {
                            return (
                                element.scrollWidth <=
                                element.clientWidth +
                                    1
                            );
                        }
                    );

                expect(
                    contentFitsContainer
                ).toBe(
                    true
                );

                const limitationDetails =
                    growthRecommendation
                        .locator(
                            "details"
                        );

                const limitationSummary =
                    limitationDetails
                        .locator(
                            "summary"
                        );

                await limitationSummary
                    .focus();

                await page.keyboard
                    .press(
                        "Enter"
                    );

                await expect(
                    limitationDetails
                ).toHaveAttribute(
                    "open",
                    ""
                );

                await expect(
                    growthRecommendation
                        .locator(
                            ".dna-traceability__source-link"
                        )
                        .first()
                ).toBeVisible();

                await expect(
                    page.getByRole(
                        "button",
                        {
                            name:
                                "Refresh traceability",
                            exact:
                                true
                        }
                    )
                ).toBeVisible();
            }
        );
    }
);
