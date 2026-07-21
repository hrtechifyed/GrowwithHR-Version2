/* GrowWithHR build marker and isolated private-beta module loader */
(() => {
    "use strict";

    const BUILD_ID = "report-experience-20260722-0001";
    const scriptUrl = document.currentScript?.src || window.location.href;
    const rootUrl = new URL("../", scriptUrl);
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug") === "1";

    window.GWHR_BUILD_ID = BUILD_ID;
    window.GWHR_DEBUG = debug;
    window.GWHR_LOG = (prefix, payload) => {
        if (!debug && prefix !== "[GrowWithHR:BUILD]") return;
        console.info(prefix, payload);
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
