import {
    expect,
    Page,
    test
} from "@playwright/test";

async function waitForAssessment(page: Page): Promise<void> {
    await page.waitForFunction(() => {
        const application = (
            window as Window & {
                executiveAssessment?: {
                    __modularFacadeInstalled?: boolean;
                };
            }
        ).executiveAssessment;
        const shell = document.getElementById(
            "assessmentShell"
        );

        return Boolean(
            application?.__modularFacadeInstalled &&
            shell?.dataset.navigationGuard ===
                "ready"
        );
    });
}

async function expectMoment(
    page: Page,
    moment: number,
    titleText: string
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

    await expect(
        page.locator("#stepTitle")
    ).toContainText(titleText);

    await expect(
        page.locator("#storyContainer .has-error")
    ).toHaveCount(0);
}

async function continueOnce(page: Page): Promise<void> {
    const button = page.locator("#nextButton");

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(button).not.toHaveAttribute(
        "aria-busy",
        "true"
    );
    await button.click();
}

test.describe(
    "Assessment navigation resilience",
    () => {
        test.setTimeout(90_000);

        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({
                width: 1280,
                height: 900
            });

            await page.addInitScript(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
        });

        test(
            "double activation advances once and the complete journey remains usable",
            async ({ page }) => {
                const pageErrors: string[] = [];

                page.on("pageerror", (error) => {
                    pageErrors.push(error.message);
                });

                await page.goto(
                    "/analyze-company.html"
                );
                await waitForAssessment(page);

                await page.getByRole(
                    "button",
                    { name: "Start my advisory" }
                ).click();

                await page.locator("#companyName").fill(
                    "Navigation Resilience Company"
                );
                await page.locator("#industry").fill(
                    "Information Technology / SaaS"
                );
                await page.locator("#nature").fill(
                    "We provide HR technology services to growing companies."
                );

                const firstContinue =
                    page.locator("#nextButton");
                await expect(firstContinue).toBeEnabled();
                await firstContinue.dblclick({
                    delay: 25
                });

                await expectMoment(
                    page,
                    1,
                    "context around its stage"
                );

                await page.locator("#founded").fill("2022");
                await page.locator("#entity").selectOption(
                    "Private Limited"
                );

                await continueOnce(page);
                await expectMoment(
                    page,
                    2,
                    "Who helps the organisation deliver"
                );

                await page.locator("#employees").fill("25");

                await continueOnce(page);
                await expectMoment(
                    page,
                    3,
                    "How does the team usually work"
                );

                await page.locator(
                    "label.advisory-choice-card",
                    { hasText: "Hybrid" }
                ).click();
                await page.locator(
                    "label.advisory-choice-pill",
                    { hasText: "25–50%" }
                ).click();

                await continueOnce(page);
                await expectMoment(
                    page,
                    4,
                    "How distributed are your operations"
                );

                await page.locator("#primaryState").fill(
                    "Maharashtra"
                );
                await page.locator("#locations").fill("1");
                await page.locator("#countries").fill("1");

                await continueOnce(page);
                await expectMoment(
                    page,
                    5,
                    "What is likely to change next"
                );

                await page.locator(
                    "label.advisory-choice-card",
                    { hasText: "Stay about the same size" }
                ).click();
                await page.locator(
                    "label.advisory-checkbox-card",
                    { hasText: "No major expansion planned" }
                ).click();

                await continueOnce(page);
                await expectMoment(
                    page,
                    6,
                    "How are people decisions supported today"
                );

                await page.locator(
                    "label.advisory-choice-card",
                    { hasText: "Founder-led" }
                ).click();
                await page.locator(
                    "label.advisory-checkbox-card",
                    { hasText: "Hiring and onboarding" }
                ).click();

                await continueOnce(page);

                await expect(
                    page.locator("#reviewScreen")
                ).toBeVisible();
                await expect(
                    page.locator("#conversationWorkspace")
                ).toBeHidden();
                expect(pageErrors).toEqual([]);
            }
        );
    }
);
