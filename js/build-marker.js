/* GrowWithHR build marker and page-scoped enhancement loader */
(() => {
    "use strict";

    const BUILD_ID = "assessment-delivery-20260722-0004";
    const scriptUrl = document.currentScript?.src || window.location.href;
    const rootUrl = new URL("../", scriptUrl);
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug") === "1";
    const FIRST_SCENE_FIX_MARKER = "__firstSceneTransitionFixInstalled";

    window.GWHR_BUILD_ID = BUILD_ID;
    window.GWHR_DEBUG = debug;
    window.GWHR_LOG = (prefix, payload) => {
        if (!debug && prefix !== "[GrowWithHR:BUILD]") return;
        console.info(prefix, payload);
    };

    const cleanText = (value) => String(value ?? "").trim();

    const pageContext = () => {
        const body = document.body;
        const assessment = Boolean(
            body?.classList.contains("analyze-company-page")
        );
        const privateBeta = Boolean(
            document.getElementById("dnaTraceability")
        );
        const report = Boolean(
            !assessment && (
                document.getElementById("downloadPdfBtn") ||
                document.getElementById("executiveSummary") ||
                document.querySelector("[data-report-experience]") ||
                /advisory-report\.html$/i.test(window.location.pathname)
            )
        );

        return {
            assessment,
            privateBeta,
            report,
            enhanced: assessment || privateBeta || report
        };
    };

    const appendStylesheet = (path, marker) => {
        if (document.querySelector(`link[${marker}]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL(path, rootUrl).href;
        link.setAttribute(marker, "true");
        document.head.appendChild(link);
    };

    const loadPresentationStyles = () => {
        const context = pageContext();

        appendStylesheet(
            "css/21-logo-restore.css",
            "data-growwithhr-original-logo"
        );

        if (!context.enhanced) return;

        appendStylesheet(
            "css/19-presentation-polish.css",
            "data-growwithhr-presentation-polish"
        );

        if (context.assessment || context.report) {
            appendStylesheet(
                "css/23-report-experience.css",
                "data-growwithhr-report-experience"
            );
        }
    };

    const integrateBrandIntoNavigation = () => {
        const header = document.querySelector("[data-site-shell-header]");
        const navigation = header?.querySelector(".site-nav-glass");
        const brand = header?.querySelector(".site-brand-logo");
        const image = brand?.querySelector("img");
        if (!navigation || !brand) return;
        if (brand.parentElement !== navigation) {
            navigation.insertBefore(brand, navigation.firstChild);
        }
        if (image) {
            image.src = new URL("assets/hrtechify-logo.png", rootUrl).href;
        }
        header.classList.add("site-header-shell--integrated-brand");
    };

    const fieldValue = (application, fieldName) => {
        const field = document.getElementById(fieldName);
        return cleanText(
            field?.value ?? application?.answers?.[fieldName]
        );
    };

    const installAssessmentFirstSceneFix = (
        application = window.executiveAssessment
    ) => {
        if (
            !application ||
            typeof application.continueFromMoment !== "function" ||
            application[FIRST_SCENE_FIX_MARKER]
        ) {
            return false;
        }

        const originalContinue = application.continueFromMoment;

        application.continueFromMoment = function continueWithIndustryNormalisation() {
            if (Number(this.currentMoment) === 0) {
                this.captureAllStoryInputs?.();

                const rawIndustry = fieldValue(this, "industry");
                const resolvedIndustry = rawIndustry &&
                    typeof this.resolveIndustry === "function"
                    ? this.resolveIndustry(rawIndustry)
                    : null;

                if (rawIndustry && !resolvedIndustry) {
                    const industryInput = document.getElementById("industry");
                    const customIndustryInput = document.getElementById(
                        "customIndustry"
                    );
                    const customIndustryField = document.getElementById(
                        "customIndustryField"
                    );

                    if (industryInput) industryInput.value = "Other";
                    if (customIndustryInput) {
                        customIndustryInput.value = rawIndustry;
                    }
                    if (customIndustryField) {
                        customIndustryField.hidden = false;
                    }

                    Object.assign(this.answers || {}, {
                        industry: "Other",
                        industryId: "other",
                        industryCategory: "Other",
                        industryRuleProfile: "Other",
                        customIndustry: rawIndustry
                    });
                }
            }

            return originalContinue.call(this);
        };

        Object.defineProperty(application, FIRST_SCENE_FIX_MARKER, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: true
        });

        window.GrowWithHRAssessmentFirstSceneFix = Object.freeze({
            version: "2.0.0",
            installed: true,
            delivery: "core-normalisation"
        });

        return true;
    };

    const warmDeliveryService = () => {
        window.GrowWithHREmail
            ?.warmUp?.()
            .catch((error) => {
                window.GWHR_LOG(
                    "[GrowWithHR:DELIVERY-WARMUP]",
                    cleanText(error?.message, "Delivery warm-up failed.")
                );
            });
    };

    const bindDeliveryWarmup = () => {
        if (!pageContext().assessment) return;

        document.addEventListener("click", (event) => {
            if (
                event.target?.closest(
                    "#continueToContactButton, #generateReportButton"
                )
            ) {
                warmDeliveryService();
            }
        });
    };

    window.addEventListener(
        "growwithhr:assessment-modules-ready",
        (event) => {
            installAssessmentFirstSceneFix(event?.detail?.application);
        },
        { once: true }
    );

    const loadPrivateBetaModules = () => {
        if (!pageContext().privateBeta) return;
        import("./assessment-v3/compliance-story-presentation.js").catch(
            (error) => {
                console.error(
                    "GrowWithHR: M3 private-beta module could not load.",
                    error
                );
            }
        );
    };

    const loadReportExperienceAndPdf = async () => {
        const context = pageContext();
        if (!context.assessment && !context.report) return;

        try {
            await import("./report-experience-v019.js");
        } catch (error) {
            console.error(
                "GrowWithHR: report experience enhancements could not load.",
                error
            );
        }

        if (!window.GrowWithHRPDF) return;

        window.GrowWithHRPDFPolishReady = import("./pdf-polish.js")
            .then(() => window.GrowWithHRPDF)
            .catch((error) => {
                console.error(
                    "GrowWithHR: PDF presentation polish could not load.",
                    error
                );
                return window.GrowWithHRPDF;
            });
    };

    const initialise = () => {
        installAssessmentFirstSceneFix();
        loadPresentationStyles();
        integrateBrandIntoNavigation();
        bindDeliveryWarmup();
        loadReportExperienceAndPdf();
        loadPrivateBetaModules();

        window.GWHR_LOG("[GrowWithHR:BUILD]", {
            buildId: BUILD_ID,
            page: window.location.pathname,
            context: pageContext(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            loadedAt: new Date().toISOString()
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, {
            once: true
        });
    } else {
        initialise();
    }
})();
