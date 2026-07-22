import {
    expect,
    test
} from "@playwright/test";

const REPORT = {
    companyName: "HRTechify",
    industry: "Consulting & Professional Services",
    employees: 1,
    peopleFunction: "Founder Led",
    primaryState: "Karnataka",
    entity: "One Person Company",
    fundingStage: "Not Applicable",
    hiringPlans: "Unsure; market drives hiring needs",
    nature: "People Advisory",
    founded: "2025",
    workModel: "Remote",
    remoteWorkforce: "100%",
    locations: 1,
    countries: 1,
    priorities: [
        "Policies and compliance",
        "Manager capability"
    ]
};

test("keeps the original HRTechify logo inside the navigation capsule", async ({ page }) => {
    await page.addInitScript((report) => {
        localStorage.setItem("growwithhr-report", JSON.stringify(report));
    }, REPORT);

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/executive-advisory-report.html");

    const navigation = page.locator(".site-nav-glass");
    const brand = navigation.locator(":scope > .site-brand-logo");
    const logo = brand.locator("img");

    await expect(navigation).toBeVisible();
    await expect(brand).toBeVisible();
    await expect(logo).toHaveAttribute(
        "src",
        /assets\/hrtechify-logo\.png$/
    );

    const presentation = await logo.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
            blendMode: style.mixBlendMode,
            backgroundColor: style.backgroundColor
        };
    });

    expect(presentation.blendMode).toBe("screen");
    expect(presentation.backgroundColor).toBe("rgba(0, 0, 0, 0)");

    const boxes = await page.evaluate(() => {
        const nav = document.querySelector(".site-nav-glass")?.getBoundingClientRect();
        const mark = document.querySelector(".site-nav-glass > .site-brand-logo")
            ?.getBoundingClientRect();

        return nav && mark
            ? {
                nav: {
                    left: nav.left,
                    right: nav.right,
                    top: nav.top,
                    bottom: nav.bottom
                },
                mark: {
                    left: mark.left,
                    right: mark.right,
                    top: mark.top,
                    bottom: mark.bottom
                }
            }
            : null;
    });

    expect(boxes).not.toBeNull();
    expect(boxes!.mark.left).toBeGreaterThanOrEqual(boxes!.nav.left);
    expect(boxes!.mark.right).toBeLessThanOrEqual(boxes!.nav.right);
    expect(boxes!.mark.top).toBeGreaterThanOrEqual(boxes!.nav.top);
    expect(boxes!.mark.bottom).toBeLessThanOrEqual(boxes!.nav.bottom);
});

test("balances the five executive snapshot cards and contains long values", async ({ page }) => {
    await page.addInitScript((report) => {
        localStorage.setItem("growwithhr-report", JSON.stringify(report));
    }, REPORT);

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/executive-advisory-report.html");

    const cards = page.locator(".executive-profile-strip .executive-metric-card");
    await expect(cards).toHaveCount(5);
    await expect(page.locator("#companyIndustry")).toHaveText(
        "Consulting & Professional Services"
    );

    const layout = await cards.evaluateAll((elements) => elements.map((element) => {
        const box = element.getBoundingClientRect();
        const value = element.querySelector(".metric-value") as HTMLElement | null;
        return {
            left: box.left,
            right: box.right,
            top: box.top,
            width: box.width,
            valueFits: value
                ? value.scrollWidth <= value.clientWidth + 1
                : false
        };
    }));

    expect(layout.slice(0, 3).every((card) => Math.abs(card.top - layout[0].top) < 2))
        .toBe(true);
    expect(Math.abs(layout[3].top - layout[4].top)).toBeLessThan(2);
    expect(layout[3].top).toBeGreaterThan(layout[0].top);
    expect(Math.abs(layout[3].left - layout[0].left)).toBeLessThan(4);
    expect(Math.abs(layout[4].right - layout[2].right)).toBeLessThan(4);
    expect(layout.every((card) => card.valueFits)).toBe(true);
});

test("loads the page-safe PDF renderer on the public sample route", async ({ page }) => {
    await page.goto("/sample-advisory-report.html");

    await page.waitForFunction(() => (
        window.GrowWithHRPDF?.version === "3.1.0-clean-report-layout"
    ));

    const version = await page.evaluate(() => window.GrowWithHRPDF?.version);
    expect(version).toBe("3.1.0-clean-report-layout");
});
