import {
    expect,
    test
} from "@playwright/test";

const STORAGE_KEY =
    "growwithhr-advisory-briefing-v2";

const REPORT = {
    companyName: "Width Test Company",
    industry: "Consulting & Professional Services",
    employees: 9,
    peopleFunction: "Founder Led",
    primaryState: "Karnataka",
    entity: "Private Limited",
    fundingStage: "Bootstrapped",
    hiringPlans: "Moderate Growth",
    nature: "HR Consulting",
    founded: "2024",
    workModel: "Hybrid",
    remoteWorkforce: "25–50%",
    locations: 1,
    countries: 1,
    priorities: []
};

test.describe(
    "Assessment first-scene transition",
    () => {
        test.beforeEach(
            async ({ page }) => {
                await page.addInitScript(
                    () => {
                        window.localStorage.clear();
                        window.sessionStorage.clear();
                    }
                );
            }
        );

        test(
            "continues when a completed industry is custom free text",
            async ({ page }) => {
                await page.goto(
                    "/analyze-company.html"
                );

                await page.waitForFunction(
                    () => {
                        const browserWindow =
                            window as Window & {
                                executiveAssessment?:
                                    unknown;

                                GrowWithHRAssessmentFirstSceneFix?: {
                                    installed?:
                                        boolean;
                                };
                            };

                        return Boolean(
                            browserWindow
                                .executiveAssessment &&
                            browserWindow
                                .GrowWithHRAssessmentFirstSceneFix
                                ?.installed
                        );
                    }
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
                        "Transition Test Company"
                    );

                await page
                    .locator(
                        "#industry"
                    )
                    .fill(
                        "People analytics platform"
                    );

                await page
                    .locator(
                        "#nature"
                    )
                    .fill(
                        "We provide people analytics software to growing businesses."
                    );

                await page
                    .locator(
                        "#nextButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#stepTitle"
                    )
                ).toContainText(
                    "context around its stage"
                );

                await expect(
                    page.locator(
                        "#founded"
                    )
                ).toBeVisible();

                const savedState =
                    await page.evaluate(
                        (storageKey) => {
                            const raw =
                                window.localStorage
                                    .getItem(
                                        storageKey
                                    );

                            return raw
                                ? JSON.parse(raw)
                                : null;
                        },
                        STORAGE_KEY
                    );

                expect(
                    savedState
                        ?.currentMoment
                ).toBe(1);

                expect(
                    savedState
                        ?.answers
                        ?.industry
                ).toBe(
                    "Other"
                );

                expect(
                    savedState
                        ?.answers
                        ?.customIndustry
                ).toBe(
                    "People analytics platform"
                );
            }
        );

        test(
            "guides HR industry search and removes the priority-selection gate",
            async ({ page }) => {
                await page.goto(
                    "/analyze-company.html"
                );

                await page.waitForFunction(
                    () => {
                        const browserWindow = window as Window & {
                            executiveAssessment?: unknown;
                            GrowWithHRFounderAssessmentUX?: {
                                guidedIndustryAutocomplete?: boolean;
                                priorityQuestionRemoved?: boolean;
                            };
                        };

                        return Boolean(
                            browserWindow.executiveAssessment &&
                            browserWindow.GrowWithHRFounderAssessmentUX?.guidedIndustryAutocomplete &&
                            browserWindow.GrowWithHRFounderAssessmentUX?.priorityQuestionRemoved
                        );
                    }
                );

                await page.getByRole("button", { name: "Start my advisory" }).click();

                const industry = page.locator("#industry");
                await industry.fill("H");
                await expect(page.locator("#industryGuidedOptions")).toBeVisible();
                expect(await page.locator("#industryGuidedOptions [role='option']").count()).toBeGreaterThan(1);

                await industry.fill("HR");
                const hrConsulting = page.locator("#industryGuidedOptions [role='option']", { hasText: "HR Consulting" });
                await expect(hrConsulting).toBeVisible();
                await hrConsulting.click();

                await expect(industry).toHaveValue("Consulting & Professional Services");

                const resolvedIndustry = await page.evaluate(() => {
                    const app = (window as Window & { executiveAssessment?: any }).executiveAssessment;
                    return {
                        id: app?.answers?.industryId,
                        industry: app?.answers?.industry,
                        category: app?.answers?.industryCategory
                    };
                });

                expect(resolvedIndustry.id).not.toBe("other");
                expect(resolvedIndustry.industry).toBe("Consulting & Professional Services");

                await page.evaluate(() => {
                    const app = (window as Window & { executiveAssessment?: any }).executiveAssessment;
                    app?.showMoment?.(6);
                });

                await expect(page.getByText("Founder-led", { exact: true })).toBeVisible();
                await expect(page.locator('[data-field-wrapper="priorities"]')).toHaveCount(0);
                await page.getByText("Founder-led", { exact: true }).click();

                const validation = await page.evaluate(() => {
                    const app = (window as Window & { executiveAssessment?: any }).executiveAssessment;
                    return {
                        valid: app?.validatePeopleReadiness?.(),
                        priorities: app?.answers?.priorities
                    };
                });

                expect(validation.valid).toBe(true);
                expect(validation.priorities).toEqual([]);
            }
        );

        test(
            "uses the full report container and full A4 content width",
            async ({ page }) => {
                await page.addInitScript((report) => {
                    localStorage.setItem("growwithhr-report", JSON.stringify(report));
                }, REPORT);
                await page.setViewportSize({ width: 1440, height: 1000 });
                await page.goto("/executive-advisory-report.html");

                const shell = page.locator("#founderReportRoot");
                await expect(shell).toBeVisible();
                await expect(shell.locator("h1")).toHaveText("HR Compliance & Growth Report", { timeout: 15000 });

                const shellBox = await shell.evaluate((element) => {
                    const box = element.getBoundingClientRect();
                    return {
                        width: box.width,
                        left: box.left,
                        right: window.innerWidth - box.right
                    };
                });
                expect(shellBox.width).toBeGreaterThan(1200);
                expect(Math.abs(shellBox.left - shellBox.right)).toBeLessThan(5);

                await page.waitForFunction(() => {
                    const browserWindow = window as Window & {
                        GrowWithHRReportBrandTemplate?: {
                            fullUsablePageWidth?: boolean;
                            contentWidth?: number;
                        };
                    };
                    return browserWindow.GrowWithHRReportBrandTemplate?.fullUsablePageWidth === true;
                });

                const layout = await page.evaluate(() => {
                    const template = (window as Window & { GrowWithHRReportBrandTemplate?: any }).GrowWithHRReportBrandTemplate;
                    return {
                        fullUsablePageWidth: template?.fullUsablePageWidth,
                        contentWidth: template?.contentWidth
                    };
                });

                expect(layout.fullUsablePageWidth).toBe(true);
                expect(layout.contentWidth).toBe(178);
            }
        );
    }
);
