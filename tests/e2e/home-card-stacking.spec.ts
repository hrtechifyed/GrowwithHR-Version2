import {
    expect,
    type Page,
    test
} from "@playwright/test";

const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 900 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 360, height: 640 }
] as const;

async function expectNoHorizontalOverflow(
    page: Page
): Promise<void> {
    const overflow = await page.evaluate(() => {
        return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1
        );
    });

    expect(overflow).toBe(false);
}

async function expectElementsInsideViewport(
    page: Page,
    selector: string
): Promise<void> {
    const results = await page.locator(selector).evaluateAll(
        (elements) => {
            return elements.map((element) => {
                const rect = element.getBoundingClientRect();

                return {
                    left: rect.left,
                    right: rect.right,
                    width: rect.width
                };
            });
        }
    );

    expect(results.length).toBeGreaterThan(0);

    for (const result of results) {
        expect(result.width).toBeGreaterThan(0);
        expect(result.left).toBeGreaterThanOrEqual(-1);
        expect(result.right).toBeLessThanOrEqual(
            page.viewportSize()!.width + 1
        );
    }
}

test.describe(
    "homepage responsive layout",
    () => {
        for (const viewport of VIEWPORTS) {
            test(
                `keeps the current homepage contract at ${viewport.width}x${viewport.height}`,
                async ({ page }) => {
                    await page.setViewportSize(viewport);
                    await page.goto("/?e2e=1");

                    const executiveStack =
                        page.getByTestId(
                            "home-executive-stack"
                        );
                    const processStack =
                        page.getByTestId(
                            "home-process-stack"
                        );
                    const capabilitiesStack =
                        page.getByTestId(
                            "home-capabilities-stack"
                        );

                    await expect(
                        executiveStack
                    ).toBeVisible();
                    await expect(
                        processStack
                    ).toBeVisible();
                    await expect(
                        capabilitiesStack
                    ).toBeVisible();

                    const executiveCards =
                        executiveStack.locator(
                            ":scope > .workspace-card"
                        );
                    const processCards =
                        processStack.locator(
                            ":scope > .how-card"
                        );
                    const capabilityCards =
                        capabilitiesStack.locator(
                            ":scope > .capability-slide"
                        );

                    await expect(
                        executiveCards
                    ).toHaveCount(3);
                    await expect(
                        processCards
                    ).toHaveCount(3);
                    await expect(
                        capabilityCards
                    ).toHaveCount(8);

                    await expect(
                        executiveCards.first()
                    ).toHaveCSS(
                        "position",
                        "relative"
                    );
                    await expect(
                        processCards.first()
                    ).toHaveCSS(
                        "position",
                        "relative"
                    );
                    await expect(
                        capabilityCards.first()
                    ).toHaveCSS(
                        "position",
                        "relative"
                    );

                    await expectElementsInsideViewport(
                        page,
                        '[data-testid="home-executive-stack"] > .workspace-card'
                    );
                    await expectElementsInsideViewport(
                        page,
                        '[data-testid="home-process-stack"] > .how-card'
                    );

                    await expectNoHorizontalOverflow(
                        page
                    );
                }
            );
        }

        test(
            "does not show the homepage intelligence graph",
            async ({ page }) => {
                await page.setViewportSize({
                    width: 1440,
                    height: 900
                });
                await page.goto("/?e2e=1");

                await expect(
                    page.locator(".hero-graph")
                ).toBeHidden();
                await expect(
                    page.locator("#dnaCoreCanvas")
                ).toBeHidden();

                const dashboardLayout = page.locator(
                    ".hero-dashboard-layout"
                );
                await expect(dashboardLayout).toBeVisible();

                const gridTemplateAreas = await dashboardLayout.evaluate(
                    (element) => getComputedStyle(element).gridTemplateAreas
                );
                expect(gridTemplateAreas).not.toContain("graph");
            }
        );
    }
);
