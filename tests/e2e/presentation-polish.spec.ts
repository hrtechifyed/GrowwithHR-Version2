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
    await expect(logo).toHaveAttribute("src", /assets\/hrtechify-logo\.png$/);

    const boxes = await page.evaluate(() => {
        const nav = document.querySelector(".site-nav-glass")?.getBoundingClientRect();
        const mark = document.querySelector(".site-nav-glass > .site-brand-logo")?.getBoundingClientRect();
        return nav && mark
            ? {
                nav: { left: nav.left, right: nav.right, top: nav.top, bottom: nav.bottom },
                mark: { left: mark.left, right: mark.right, top: mark.top, bottom: mark.bottom }
            }
            : null;
    });

    expect(boxes).not.toBeNull();
    expect(boxes!.mark.left).toBeGreaterThanOrEqual(boxes!.nav.left);
    expect(boxes!.mark.right).toBeLessThanOrEqual(boxes!.nav.right);
    expect(boxes!.mark.top).toBeGreaterThanOrEqual(boxes!.nav.top);
    expect(boxes!.mark.bottom).toBeLessThanOrEqual(boxes!.nav.bottom);
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
    await expect(page.getByText("Your company information")).toBeVisible();
    await expect(page.getByText("What GrowWithHR identified")).toBeVisible();
    await expect(page.getByText("What this report does not assess")).toBeVisible();
    await expect(page.getByText("Your founder action list")).toBeVisible();
    await expect(page.getByText("Deterministic first, explanation second")).toBeVisible();
    await expect(page.getByText("End of Report")).toBeVisible();

    await expect(page.locator(".executive-profile-strip")).toHaveCount(0);
    await expect(page.locator(".executive-metric-card")).toHaveCount(0);
    await expect(page.locator(".gwh-web-section [data-score], .gwh-web-section .score-card, .gwh-web-section .metric-card")).toHaveCount(0);
    await expect(page.locator("input[name='advisoryReportTheme']")).toHaveCount(0);
    await expect(page.locator("input[name='reportTheme']")).toHaveCount(0);
    await expect(page.getByText("Dark Version", { exact: false })).toHaveCount(0);

    const layout = await page.locator(".gwh-web-section").first().evaluate((element) => {
        const box = element.getBoundingClientRect();
        return { width: box.width, left: box.left, right: box.right };
    });
    expect(layout.width).toBeGreaterThan(700);
    expect(layout.left).toBeGreaterThan(100);
    expect(layout.right).toBeLessThan(1340);
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
    await page.goto("/analyze-company.html");
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
