import {
    expect,
    Page,
    test
} from "@playwright/test";

async function waitForAssessmentGuard(page: Page): Promise<void> {
    await page.waitForFunction(() => {
        const shell = document.getElementById("assessmentShell");
        const application = (
            window as Window & {
                executiveAssessment?: {
                    __modularFacadeInstalled?: boolean;
                };
            }
        ).executiveAssessment;

        return Boolean(
            application?.__modularFacadeInstalled &&
            shell?.dataset.navigationGuard === "ready"
        );
    });
}

async function expectMoment(
    page: Page,
    moment: number
): Promise<void> {
    await expect.poll(async () => {
        return page.evaluate(() => {
            return (
                window as Window & {
                    executiveAssessment?: {
                        currentMoment?: number;
                    };
                }
            ).executiveAssessment?.currentMoment;
        });
    }).toBe(moment);
}

test.describe(
    "Assessment stage Continue",
    () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({
                width: 1724,
                height: 864
            });

            await page.addInitScript(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
        });

        test(
            "advances from the business-stage screen when duplicate submits occur",
            async ({ page }) => {
                const pageErrors: string[] = [];

                page.on("pageerror", (error) => {
                    pageErrors.push(error.message);
                });

                await page.goto("/analyze-company.html");
                await waitForAssessmentGuard(page);

                await page.getByRole(
                    "button",
                    { name: "Start my advisory" }
                ).click();

                await page.locator("#companyName").fill(
                    "Stage Continue Company"
                );
                await page.locator("#industry").fill(
                    "People analytics platform"
                );
                await page.locator("#nature").fill(
                    "We provide people analytics software to growing organisations."
                );
                await page.locator("#nextButton").click();

                await expectMoment(page, 1);
                await expect(page.locator("#founded")).toBeVisible();

                await page.locator("#founded").fill("2025");
                await page.locator("#entity").selectOption({
                    label: "Not sure"
                });
                await page.locator("#fundingStage").selectOption({
                    label: "Not sure"
                });

                await page.evaluate(() => {
                    const form = document.getElementById(
                        "storyForm"
                    ) as HTMLFormElement | null;
                    const button = document.getElementById(
                        "nextButton"
                    ) as HTMLButtonElement | null;

                    if (!form || !button) {
                        throw new Error(
                            "Assessment Continue controls are unavailable."
                        );
                    }

                    form.requestSubmit(button);
                    form.requestSubmit(button);
                });

                await expectMoment(page, 2);
                await expect(page.locator("#employees")).toBeVisible();
                await expect(
                    page.locator("#storyContainer .has-error")
                ).toHaveCount(0);
                await expect(
                    page.locator("#nextButton")
                ).not.toHaveAttribute("aria-busy", "true", {
                    timeout: 2_000
                });
                expect(pageErrors).toEqual([]);
            }
        );

        test(
            "unlocks Continue immediately after a validation error",
            async ({ page }) => {
                await page.goto("/analyze-company.html");
                await waitForAssessmentGuard(page);

                await page.getByRole(
                    "button",
                    { name: "Start my advisory" }
                ).click();

                await page.locator("#nextButton").click();

                await expect(
                    page.locator("#storyContainer .has-error")
                ).toHaveCount(3);
                await expect(
                    page.locator("#nextButton")
                ).not.toHaveAttribute("aria-busy", "true");

                await page.locator("#companyName").fill(
                    "Recovered Continue Company"
                );
                await page.locator("#industry").fill(
                    "HR technology"
                );
                await page.locator("#nature").fill(
                    "We provide HR technology services."
                );
                await page.locator("#nextButton").click();

                await expectMoment(page, 1);
            }
        );
    }
);
