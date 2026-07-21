/* GrowWithHR build marker and isolated private-beta module loader */
(() => {
    "use strict";

    const BUILD_ID = "presentation-polish-20260721-0002";
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

    const loadPresentationStyles = () => {
        if (document.querySelector("link[data-growwithhr-presentation-polish]")) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL("css/19-presentation-polish.css", rootUrl).href;
        link.dataset.growwithhrPresentationPolish = "true";
        document.head.appendChild(link);
    };

    const loadPrivateBetaModules = () => {
        if (!document.getElementById("dnaTraceability")) return;
        import("./assessment-v3/compliance-story-presentation.js").catch((error) => {
            console.error("GrowWithHR: M3 private-beta module could not load.", error);
        });
    };

    const loadPresentationPolish = () => {
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
        loadPresentationPolish();
        loadPrivateBetaModules();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", logBuild, { once: true });
    } else {
        logBuild();
    }
})();
