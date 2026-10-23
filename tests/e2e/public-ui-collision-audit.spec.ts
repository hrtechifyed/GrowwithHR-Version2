import { expect, test } from "@playwright/test";

// Keep core free-beta routes usable on common phone, tablet and desktop widths.
// This catches cross-route regressions rather than fixing individual screenshots only.
const publicRoutes = [
  "/index.html",
  "/founding-beta.html",
  "/sample-reports.html",
  "/sample-advisory-report.html",
  "/organization-intelligence.html",
  "/compliance-intelligence.html",
  "/organization-structure-report.html?sample=1",
  "/official-resources.html",
  "/more-info.html",
  "/security.html",
  "/terms.html",
  "/my-reports.html",
  "/organization-structure-methodology.html"
];

test("sample compliance PDF action and live feedback occupy separate rows on all screen sizes", async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/sample-advisory-report.html", { waitUntil: "domcontentloaded" });
    const button = page.locator("#downloadSampleAdvisoryPdf");
    const status = page.locator("#samplePdfStatus");
    await expect(button).toBeVisible();
    await expect(status).toBeHidden();
    await page.evaluate(() => {
      (window as any).GrowWithHRPDF = {
        async downloadAdvisoryPdf() { return null; }
      };
    });
    await button.click();
    await expect(status).toContainText("download has started");
    await expect(status).toBeVisible();
    const geometry = await page.evaluate(() => {
      const button = document.getElementById("downloadSampleAdvisoryPdf")!.getBoundingClientRect();
      const status = document.getElementById("samplePdfStatus")!.getBoundingClientRect();
      return {
        gap: Math.round(status.top - button.bottom),
        buttonRight: Math.round(button.right),
        statusRight: Math.round(status.right),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    expect(geometry.gap, `width=${width}: status must not touch the button`).toBeGreaterThanOrEqual(12);
    expect(geometry.buttonRight, `width=${width}: button must remain within the screen`).toBeLessThanOrEqual(width + 2);
    expect(geometry.statusRight, `width=${width}: status must remain within the screen`).toBeLessThanOrEqual(width + 2);
    expect(geometry.documentWidth - geometry.viewportWidth).toBeLessThanOrEqual(2);

    await page.evaluate(() => {
      (window as any).GrowWithHRPDF = {
        async downloadAdvisoryPdf() { throw new Error("Synthetic PDF outage"); }
      };
    });
    await button.click();
    await expect(status).toContainText("could not prepare");
    await expect(status).toHaveClass(/is-error/);
    await expect(button).toBeEnabled();
  }
});

test("public routes do not create unintended document-level horizontal scrolling", async ({ page }) => {
  test.setTimeout(180_000);
  const issues: string[] = [];
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("[data-site-shell-header]")).toHaveCount(1);
      const view = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        const doc = document.documentElement.scrollWidth;
        const visible = Array.from(document.querySelectorAll(
          "main h1, main h2, main button, main a, main input, main select, main textarea, main [role='status']"
        )).filter((el) => {
          const box = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return box.width > 1 && box.height > 1 && style.visibility !== "hidden" &&
            style.display !== "none" && !el.closest("[hidden], [aria-hidden='true']");
        });
        const cutOff = visible.filter(el => {
          const box = el.getBoundingClientRect();
          return box.left < -8 || box.right > limit + 8;
        }).slice(0, 4).map(el => ({
          tag: el.tagName.toLowerCase(),
          label: el.textContent?.replace(/\s+/g, " ").trim().slice(0, 48),
          left: Math.round(el.getBoundingClientRect().left),
          right: Math.round(el.getBoundingClientRect().right)
        }));
        return { doc, limit, cutOff };
      });
      if (view.doc - view.limit > 2 || view.cutOff.length) {
        issues.push(`${route} @ ${width}px — document overflow ${view.doc - view.limit}px; clipped content: ${JSON.stringify(view.cutOff)}`);
      }
    }
  }
  expect(issues, "Public route responsive UI audit").toEqual([]);
});
