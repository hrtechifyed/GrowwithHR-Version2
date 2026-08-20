import { expect, test } from "@playwright/test";

test.describe("Sample advisory report presentation", () => {
    test("uses compact aligned desktop spacing and a production-shaped sample Report ID", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1100 });
        await page.goto("/sample-advisory-report.html", { waitUntil: "networkidle" });

        const identity = page.locator("#sampleReportIdentity");
        await expect(identity).toBeVisible();
        await expect(identity).toContainText("Sample Report ID");

        const identityText = (await identity.textContent()) || "";
        const match = identityText.match(/GWHR-\d{4}-\d{4}-SM01/);
        expect(match).not.toBeNull();

        const runtimeIdentity = await page.evaluate(() => {
            const runtime = (window as Window & {
                GrowWithHRSampleAdvisory?: {
                    reportId?: string;
                    report?: { reportId?: string };
                };
            }).GrowWithHRSampleAdvisory;

            return {
                reportId: runtime?.reportId || "",
                reportReportId: runtime?.report?.reportId || ""
            };
        });

        expect(runtimeIdentity.reportId).toBe(match![0]);
        expect(runtimeIdentity.reportReportId).toBe(match![0]);

        const layout = await page.evaluate(() => {
            const number = (value: string) => Number.parseFloat(value) || 0;
            const columnCount = (element: Element | null) => {
                if (!element) return 0;
                return getComputedStyle(element).gridTemplateColumns
                    .split(" ")
                    .filter(Boolean).length;
            };
            const boxes = (selector: string) => Array.from(
                document.querySelectorAll(selector),
                (element) => element.getBoundingClientRect()
            );

            const firstSection = document.querySelector(".sample-advisory-page .section");
            const headingWithCopy = Array.from(
                document.querySelectorAll(".sample-advisory-page .section-heading")
            ).find((heading) => heading.querySelector("p"));
            const heading = headingWithCopy?.querySelector("h2");
            const paragraph = headingWithCopy?.querySelector("p");
            const profile = document.querySelector(".sample-advisory-page .executive-profile-strip");
            const statusGrid = document.querySelector(".sample-advisory-page .executive-status-grid");
            const profileCards = boxes(".sample-advisory-page .executive-profile-strip .executive-metric-card");
            const statusCards = boxes(".sample-advisory-page .executive-status-grid .executive-metric-card");
            const timelineCards = boxes(".sample-advisory-page .timeline-grid > div");

            const headingBox = heading?.getBoundingClientRect();
            const paragraphBox = paragraph?.getBoundingClientRect();
            const firstStyle = firstSection ? getComputedStyle(firstSection) : null;

            return {
                sectionPaddingTop: firstStyle ? number(firstStyle.paddingTop) : 999,
                sectionPaddingBottom: firstStyle ? number(firstStyle.paddingBottom) : 999,
                headingParagraphLeftDelta:
                    headingBox && paragraphBox
                        ? Math.abs(headingBox.left - paragraphBox.left)
                        : 999,
                profileColumns: columnCount(profile),
                profileTopSpread: profileCards.length
                    ? Math.max(...profileCards.map((box) => box.top)) - Math.min(...profileCards.map((box) => box.top))
                    : 999,
                profileMaxHeight: profileCards.length
                    ? Math.max(...profileCards.map((box) => box.height))
                    : 999,
                statusDisplay: statusGrid ? getComputedStyle(statusGrid).display : "",
                statusColumns: columnCount(statusGrid),
                statusMaxHeight: statusCards.length
                    ? Math.max(...statusCards.map((box) => box.height))
                    : 999,
                timelineLeftSpread: timelineCards.length
                    ? Math.max(...timelineCards.map((box) => box.left)) - Math.min(...timelineCards.map((box) => box.left))
                    : 999,
                timelineWidthSpread: timelineCards.length
                    ? Math.max(...timelineCards.map((box) => box.width)) - Math.min(...timelineCards.map((box) => box.width))
                    : 999,
                overflow:
                    document.documentElement.scrollWidth -
                    document.documentElement.clientWidth
            };
        });

        expect(layout.sectionPaddingTop).toBeLessThanOrEqual(70);
        expect(layout.sectionPaddingBottom).toBeLessThanOrEqual(70);
        expect(layout.headingParagraphLeftDelta).toBeLessThanOrEqual(1);
        expect(layout.profileColumns).toBe(5);
        expect(layout.profileTopSpread).toBeLessThanOrEqual(2);
        expect(layout.profileMaxHeight).toBeLessThan(200);
        expect(layout.statusDisplay).toBe("grid");
        expect(layout.statusColumns).toBe(2);
        expect(layout.statusMaxHeight).toBeLessThan(190);
        expect(layout.timelineLeftSpread).toBeLessThanOrEqual(1);
        expect(layout.timelineWidthSpread).toBeLessThanOrEqual(1);
        expect(layout.overflow).toBeLessThanOrEqual(2);
    });

    test("keeps sample report alignment readable on mobile without horizontal overflow", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto("/sample-advisory-report.html", { waitUntil: "networkidle" });

        await expect(page.locator("#sampleReportIdentity")).toBeVisible();

        const mobile = await page.evaluate(() => {
            const columnCount = (selector: string) => getComputedStyle(
                document.querySelector(selector) as Element
            ).gridTemplateColumns.split(" ").filter(Boolean).length;

            const identityBox = document
                .querySelector("#sampleReportIdentity")
                ?.getBoundingClientRect();

            return {
                profileColumns: columnCount(
                    ".sample-advisory-page .executive-profile-strip"
                ),
                statusColumns: columnCount(
                    ".sample-advisory-page .executive-status-grid"
                ),
                identityFits:
                    Boolean(identityBox) &&
                    identityBox!.left >= 0 &&
                    identityBox!.right <= window.innerWidth,
                overflow:
                    document.documentElement.scrollWidth -
                    document.documentElement.clientWidth
            };
        });

        expect(mobile.profileColumns).toBe(1);
        expect(mobile.statusColumns).toBe(1);
        expect(mobile.identityFits).toBe(true);
        expect(mobile.overflow).toBeLessThanOrEqual(2);
    });
});
