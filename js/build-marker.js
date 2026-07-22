/* GrowWithHR build marker and isolated private-beta module loader */
(() => {
    "use strict";

    const BUILD_ID = "assessment-first-scene-hotfix-20260722-0003";
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

    const fieldValue = (application, fieldName) => {
        const field = document.getElementById(fieldName);
        return cleanText(field?.value ?? application?.answers?.[fieldName]);
    };

    const hasVisibleError = (fieldName) => {
        const error = document.getElementById(`${fieldName}Error`);
        return Boolean(error && !error.hidden && cleanText(error.textContent));
    };

    const installAssessmentFirstSceneFix = (application = window.executiveAssessment) => {
        if (
            !application ||
            typeof application.continueFromMoment !== "function" ||
            application[FIRST_SCENE_FIX_MARKER]
        ) {
            return false;
        }

        const originalContinue = application.continueFromMoment;

        application.continueFromMoment = function continueFromMomentWithCustomIndustryFallback() {
            const startingMoment = Number(this.currentMoment);

            originalContinue.call(this);

            if (
                startingMoment !== 0 ||
                Number(this.currentMoment) !== 0 ||
                !hasVisibleError("industry") ||
                hasVisibleError("companyName") ||
                hasVisibleError("nature")
            ) {
                return;
            }

            const companyName = fieldValue(this, "companyName");
            const rawIndustry = fieldValue(this, "industry");
            const nature = fieldValue(this, "nature");

            if (!companyName || !rawIndustry || !nature) {
                return;
            }

            const industryInput = document.getElementById("industry");
            const customIndustryInput = document.getElementById("customIndustry");
            const customIndustryField = document.getElementById("customIndustryField");

            if (industryInput) industryInput.value = "Other";
            if (customIndustryInput) customIndustryInput.value = rawIndustry;
            if (customIndustryField) customIndustryField.hidden = false;

            this.answers = this.answers || {};
            Object.assign(this.answers, {
                industry: "Other",
                industryId: "other",
                industryCategory: "Other",
                industryRuleProfile: "Other",
                customIndustry: rawIndustry
            });

            originalContinue.call(this);
        };

        Object.defineProperty(application, FIRST_SCENE_FIX_MARKER, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: true
        });

        window.GrowWithHRAssessmentFirstSceneFix = Object.freeze({
            version: "1.1.0",
            installed: true,
            delivery: "classic-script"
        });

        return true;
    };

    window.addEventListener(
        "growwithhr:assessment-modules-ready",
        (event) => {
            installAssessmentFirstSceneFix(event?.detail?.application);
        },
        { once: true }
    );

    const installAssessmentFixWhenReady = () => {
        installAssessmentFirstSceneFix();
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            installAssessmentFixWhenReady,
            { once: true }
        );
    } else {
        installAssessmentFixWhenReady();
    }

    const appendStylesheet = (path, marker) => {
        if (document.querySelector(`link[${marker}]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL(path, rootUrl).href;
        link.setAttribute(marker, "true");
        document.head.appendChild(link);
    };

    const loadPresentationStyles = () => {
        appendStylesheet("css/19-presentation-polish.css", "data-growwithhr-presentation-polish");
        appendStylesheet("css/21-logo-restore.css", "data-growwithhr-original-logo");
        appendStylesheet("css/23-report-experience.css", "data-growwithhr-report-experience");
    };

    const integrateBrandIntoNavigation = () => {
        const header = document.querySelector("[data-site-shell-header]");
        const navigation = header?.querySelector(".site-nav-glass");
        const brand = header?.querySelector(".site-brand-logo");
        const image = brand?.querySelector("img");
        if (!navigation || !brand) return;
        if (brand.parentElement !== navigation) navigation.insertBefore(brand, navigation.firstChild);
        if (image) image.src = new URL("assets/hrtechify-logo.png", rootUrl).href;
        header.classList.add("site-header-shell--integrated-brand");
    };

    const loadPrivateBetaModules = () => {
        if (!document.getElementById("dnaTraceability")) return;
        import("./assessment-v3/compliance-story-presentation.js").catch((error) => {
            console.error("GrowWithHR: M3 private-beta module could not load.", error);
        });
    };

    const loadReportExperienceAndPdf = async () => {
        try {
            await import("./report-experience-v019.js");
        } catch (error) {
            console.error("GrowWithHR: report experience enhancements could not load.", error);
        }

        if (!window.GrowWithHRPDF) return;
        window.GrowWithHRPDFPolishReady = import("./pdf-polish.js")
            .then(() => window.GrowWithHRPDF)
            .catch((error) => {
                console.error("GrowWithHR: PDF presentation polish could not load.", error);
                return window.GrowWithHRPDF;
            });
    };

    const logBuild = () => {
        window.GWHR_LOG("[GrowWithHR:BUILD]", {
            buildId: BUILD_ID,
            page: window.location.pathname,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            loadedAt: new Date().toISOString()
        });
        loadPresentationStyles();
        integrateBrandIntoNavigation();
        loadReportExperienceAndPdf();
        loadPrivateBetaModules();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", logBuild, { once: true });
    } else {
        logBuild();
    }
})();
