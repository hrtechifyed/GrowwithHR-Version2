import { expect, type Page, test } from "@playwright/test";

const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 900 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 360, height: 640 }
] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    const overflow = await page.evaluate(() => (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
    ));
    expect(overflow).toBe(false);
}

async function expectElementsInsideViewport(page: Page, selector: string): Promise<void> {
    const results = await page.locator(selector).evaluateAll((elements) => (
        elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return { left: rect.left, right: rect.right, width: rect.width };
        })
    ));

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
        expect(result.width).toBeGreaterThan(0);
        expect(result.left).toBeGreaterThanOrEqual(-1);
        expect(result.right).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
}

test.describe("homepage product-led responsive layout", () => {
    for (const viewport of VIEWPORTS) {
        test(`keeps the product-led homepage usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto("/?e2e=1");

            const productPreview = page.getByTestId("home-product-preview");
            const processStack = page.getByTestId("home-process-stack");
            const capabilitiesStack = page.getByTestId("home-capabilities-stack");
            const reportPreview = page.getByTestId("home-report-preview");

            await expect(productPreview).toBeVisible();
            await expect(processStack).toBeVisible();
            await expect(capabilitiesStack).toBeVisible();
            await expect(reportPreview).toBeVisible();

            await expect(processStack.locator(":scope > .ph-step")).toHaveCount(3);
            await expect(capabilitiesStack.locator(":scope > .ph-product-card")).toHaveCount(3);

            await expectElementsInsideViewport(page, '[data-testid="home-product-preview"]');
            await expectElementsInsideViewport(page, '[data-testid="home-capabilities-stack"] > .ph-product-card');
            await expectElementsInsideViewport(page, '[data-testid="home-process-stack"] > .ph-step');
            await expectElementsInsideViewport(page, '[data-testid="home-report-preview"]');
            await expectNoHorizontalOverflow(page);
        });
    }

    test("uses qualitative findings and keeps the old intelligence graph absent", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("/?e2e=1");

        await expect(page.locator(".hero-graph")).toHaveCount(0);
        await expect(page.locator("#dnaCoreCanvas")).toHaveCount(0);
        await expect(page.getByText("Review may be required", { exact: true })).toBeVisible();
        await expect(page.getByText("Constraint identified", { exact: true })).toBeVisible();
        await expect(page.getByText("See recommendations", { exact: true }).first()).toBeVisible();
        await expect(page.getByText("No arbitrary scores.", { exact: false })).toBeVisible();
    });
});
