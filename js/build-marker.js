/* GrowWithHR build marker and isolated private-beta module loader */
(() => {
    "use strict";

    const BUILD_ID = "m3-compliance-story-20260721-0001";
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug") === "1";

    window.GWHR_BUILD_ID = BUILD_ID;
    window.GWHR_DEBUG = debug;
    window.GWHR_LOG = (prefix, payload) => {
        if (!debug && prefix !== "[GrowWithHR:BUILD]") return;
        console.info(prefix, payload);
    };

    const loadPrivateBetaModules = () => {
        if (!document.getElementById("dnaTraceability")) {
            return;
        }

        import("./assessment-v3/compliance-story-presentation.js")
            .catch((error) => {
                console.error(
                    "GrowWithHR: M3 private-beta module could not load.",
                    error
                );
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

        loadPrivateBetaModules();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", logBuild, { once: true });
    } else {
        logBuild();
    }
})();
