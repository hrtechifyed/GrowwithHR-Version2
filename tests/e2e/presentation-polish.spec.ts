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

const ALL_PRIORITY_VALUES = [
    "hiring-onboarding",
    "policies-compliance",
    "performance-rewards",
    "manager-capability",
    "culture-engagement",
    "hr-operations-technology",
    "workforce-planning",
    "organisation-design"
];

test("uses identical shared navbar geometry across public pages", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    const routes = [
        "/official-resources.html",
        "/sample-advisory-report.html",
        "/intelligence-hub.html"
    ];

    const measurements = [];

    for (const route of routes) {
        await page.goto(route);
        const shell = page.locator(".site-header-shell__inner");
        const brand = shell.locator(":scope > .site-brand-logo");
        const navigation = shell.locator(":scope > .site-nav-glass");

        await expect(shell).toBeVisible();
        await expect(brand).toBeVisible();
        await expect(navigation).toBeVisible();
        await expect(navigation.locator(":scope > .site-brand-logo")).toHaveCount(0);
        await expect(brand.locator("img")).toHaveAttribute("src", /assets\/hrtechify-logo\.png$/);

        measurements.push(await shell.evaluate((element) => {
            const brandElement = element.querySelector(":scope > .site-brand-logo");
            const navElement = element.querySelector(":scope > .site-nav-glass");
            const shellBox = element.getBoundingClientRect();
            const brandBox = brandElement?.getBoundingClientRect();
            const navBox = navElement?.getBoundingClientRect();

            return brandBox && navBox
                ? {
                    shell: {
                        left: shellBox.left,
                        top: shellBox.top,
                        width: shellBox.width,
                        height: shellBox.height
                    },
                    brand: {
                        left: brandBox.left,
                        top: brandBox.top,
                        width: brandBox.width,
                        height: brandBox.height
                    },
                    nav: {
                        left: navBox.left,
                        top: navBox.top,
                        width: navBox.width,
                        height: navBox.height
                    }
                }
                : null;
        }));
    }

    const baseline = measurements[0];
    expect(baseline).not.toBeNull();

    for (const measurement of measurements.slice(1)) {
        expect(measurement).not.toBeNull();
        for (const part of ["shell", "brand", "nav"] as const) {
            for (const property of ["left", "top", "width", "height"] as const) {
                expect(Math.abs(measurement![part][property] - baseline![part][property])).toBeLessThanOrEqual(2);
            }
        }
    }
});

test("renders a clean single-column compliance report without scorecards or theme choices", async ({ page }) => {
    await page.route("**/api/report-id", async (route) => {
        await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
                ok: true,
                reportId: "GWHR-2026-0811-AA01",
                suffix: "AA01",
                generatedAt: "2026-08-11T10:00:00.000Z",
                durableStorageConfigured: true
            })
        });
    });
    await page.addInitScript((report) => {
        localStorage.setItem("growwithhr-report", JSON.stringify(report));
    }, REPORT);

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/executive-advisory-report.html");

    await expect(page.locator("#founderReportRoot h1")).toHaveText("HR Compliance & Growth Report", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Your company information", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What GrowWithHR identified", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What this report does not assess", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What to do next", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Deterministic first, explanation second", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "End of Report", exact: true })).toBeVisible();

    await expect(page.locator(".executive-profile-strip")).toHaveCount(0);
    await expect(page.locator(".executive-metric-card")).toHaveCount(0);
    await expect(page.locator(".gwh-web-section [data-score], .gwh-web-section .score-card, .gwh-web-section .metric-card")).toHaveCount(0);
    await expect(page.locator("input[name='advisoryReportTheme']")).toHaveCount(0);
    await expect(page.locator("input[name='reportTheme']")).toHaveCount(0);
    await expect(page.getByText("Dark Version", { exact: false })).toHaveCount(0);

    const layout = await page.locator(".gwh-web-section").first().evaluate((element) => {
        const box = element.getBoundingClientRect();
        return {
            width: box.width,
            left: box.left,
            right: window.innerWidth - box.right
        };
    });
    expect(layout.width).toBeGreaterThan(1200);
    expect(layout.left).toBeGreaterThanOrEqual(20);
    expect(layout.left).toBeLessThan(100);
    expect(layout.right).toBeGreaterThanOrEqual(20);
    expect(layout.right).toBeLessThan(100);
    expect(Math.abs(layout.left - layout.right)).toBeLessThan(5);
});

test("loads the all-running-text dual-theme PDF renderer on the public sample route", async ({ page }) => {
    await page.goto("/sample-advisory-report.html");

    await page.waitForFunction(() => (
        window.GrowWithHRPDF?.version === "3.3.0-justified-dual-theme" &&
        window.GrowWithHRPDF?.lineLayoutVersion === "3.3.1-full-line-logo" &&
        window.GrowWithHRPDF?.runningTextPolicyVersion ===
            "3.3.2-all-running-text-justify"
    ));

    const capabilities = await page.evaluate(() => {
        const helper = window.GrowWithHRPDFRunningTextFix;
        const normalDoc = {
            getFontSize: () => 9,
            getFont: () => ({ fontStyle: "normal" }),
            getTextWidth: () => 95
        };
        const boldDoc = {
            getFontSize: () => 9,
            getFont: () => ({ fontStyle: "bold" }),
            getTextWidth: () => 95
        };

        return {
            version: window.GrowWithHRPDF?.version,
            lineLayoutVersion: window.GrowWithHRPDF?.lineLayoutVersion,
            runningTextPolicyVersion:
                window.GrowWithHRPDF?.runningTextPolicyVersion,
            supportsDualTheme: window.GrowWithHRPDF?.supportsDualTheme,
            allRunningTextJustified:
                window.GrowWithHRPDF?.allRunningTextJustified,
            minimumRunningWidth: helper?.minimumRunningWidth,
            reflowedText: helper?.fullParagraphText([
                "Your leadership selections remain the primary focus of this advisory. Complementary Company DNA insights are",
                "presented separately to help",
                "you consider the broader capabilities needed for resilient, sustainable growth."
            ]),
            narrowBodyIsRunningText: helper?.isRunningText(
                normalDoc,
                "Narrative table copy should wrap and use justified alignment consistently.",
                { maxWidth: 45 }
            ),
            boldHeadingIsRunningText: helper?.isRunningText(
                boldDoc,
                "This bold heading must retain its natural heading alignment.",
                { maxWidth: 45 }
            )
        };
    });

    expect(capabilities.version).toBe("3.3.0-justified-dual-theme");
    expect(capabilities.lineLayoutVersion).toBe("3.3.1-full-line-logo");
    expect(capabilities.runningTextPolicyVersion)
        .toBe("3.3.2-all-running-text-justify");
    expect(capabilities.supportsDualTheme).toBe(true);
    expect(capabilities.allRunningTextJustified).toBe(true);
    expect(capabilities.minimumRunningWidth).toBe(0);
    expect(capabilities.narrowBodyIsRunningText).toBe(true);
    expect(capabilities.boldHeadingIsRunningText).toBe(false);
    expect(capabilities.reflowedText).toBe(
        "Your leadership selections remain the primary focus of this advisory. Complementary Company DNA insights are presented separately to help you consider the broader capabilities needed for resilient, sustainable growth."
    );
});

test("keeps every guidance area when all priorities are selected", async ({ page }) => {
    await page.goto("/sample-advisory-report.html");
    await page.waitForFunction(() => (
        window.GrowWithHRPDF?.version === "3.3.0-justified-dual-theme"
    ));

    const model = await page.evaluate(({ report, priorities }) => (
        window.GrowWithHRPDF.buildAdvisoryModel({
            report: {
                ...report,
                priorities
            },
            answers: {
                priorities
            }
        })
    ), {
        report: REPORT,
        priorities: ALL_PRIORITY_VALUES
    });

    expect(model.priorities).toHaveLength(8);
    expect(model.recommendations).toHaveLength(8);
    expect(model.recommendations.map((item: { title: string }) => item.title))
        .toEqual([
            "Hiring and onboarding",
            "Policies and compliance",
            "Performance and rewards",
            "Manager capability",
            "Culture and engagement",
            "HR operations and technology",
            "Workforce planning",
            "Organisation design"
        ]);
});

test("applies remote and onsite workforce defaults", async ({ page }) => {
    await page.goto("/analyze-company.html?engine=compliance");
    await page.waitForFunction(() => Boolean(window.GrowWithHRReportExperience));

    const defaults = await page.evaluate(() => {
        const fieldset = document.createElement("fieldset");
        fieldset.dataset.fieldWrapper = "remoteBand";
        fieldset.innerHTML = `
            <input type="radio" name="remoteBand" value="0">
            <input type="radio" name="remoteBand" value="25">
            <input type="radio" name="remoteBand" value="50">
            <input type="radio" name="remoteBand" value="75">
            <input type="radio" name="remoteBand" value="100">`;
        document.body.appendChild(fieldset);

        window.GrowWithHRReportExperience.applyRemoteBandDefault(
            "Remote",
            { force: true }
        );
        const remote = (
            document.querySelector('input[name="remoteBand"]:checked') as HTMLInputElement
        )?.value;

        window.GrowWithHRReportExperience.applyRemoteBandDefault(
            "Office Based",
            { force: true }
        );
        const onsite = (
            document.querySelector('input[name="remoteBand"]:checked') as HTMLInputElement
        )?.value;

        fieldset.remove();
        return { remote, onsite };
    });

    expect(defaults).toEqual({ remote: "100", onsite: "0" });
});
